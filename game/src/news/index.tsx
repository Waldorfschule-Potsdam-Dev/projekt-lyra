import { useState, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import StartScreen from './StartScreen';
import DetailScreen from './DetailScreen';
import AccountScreen from './AccountScreen';
import { articles, allTopics, defaultNotifications, defaultStats, breakingNews } from './data';
import type { NotificationSettings, Stats } from './data';

function DetailScreenWrapper({
  toggleBookmark,
  bookmarkedIds,
}: {
  toggleBookmark: (id: number) => void;
  bookmarkedIds: Set<number>;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articles.find((a) => a.id === Number(id));
  if (!article) return <Navigate to="/news" replace />;

  return (
    <DetailScreen
      article={article}
      onBack={() => navigate(-1)}
      bookmarked={bookmarkedIds.has(article.id)}
      onToggleBookmark={() => toggleBookmark(article.id)}
      chat={null}
      onOpenDiscussion={() => {}}
    />
  );
}

export default function NewsApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => new Set([9, 10]));
  const [enabledTopics, setEnabledTopics] = useState<Set<string>>(() => new Set(allTopics.map((t) => t.id)));
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [stats] = useState<Stats>(defaultStats);

  const toggleBookmark = (id: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeBookmark = (id: number) => {
    setBookmarkedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };



  const bookmarkedArticles = useMemo(() => articles.filter((a) => bookmarkedIds.has(a.id)), [bookmarkedIds]);
  const visibleArticles = useMemo(
    () => articles.filter((a) => !a.hiddenFromFeed && enabledTopics.has(a.topic)),
    [enabledTopics],
  );
  const breakingArticle = useMemo(
    () => articles.find((a) => a.id === breakingNews.articleId) ?? null,
    [],
  );

  const toggleTopic = (id: string) => {
    setEnabledTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0F0F10',
        color: '#fff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Routes location={location}>
          <Route
            path="/"
            element={
              <StartScreen
                articles={visibleArticles}
                onSelect={(a) => navigate(`/news/artikel/${a.id}`)}
                onOpenAccount={() => navigate('/news/konto')}
                bookmarkCount={bookmarkedIds.size}
                breaking={breakingArticle ? { article: breakingArticle, time: breakingNews.time } : null}
              />
            }
          />
          <Route
            path="konto"
            element={
              <AccountScreen
                bookmarks={bookmarkedArticles}
                onSelect={(a) => navigate(`/news/artikel/${a.id}`)}
                onRemove={removeBookmark}
                enabledTopics={enabledTopics}
                onToggleTopic={toggleTopic}
                notifications={notifications}
                onToggleNotification={toggleNotification}
                stats={stats}
                onBack={() => navigate('/news')}
              />
            }
          />

          <Route
            path="artikel/:id"
            element={
              <DetailScreenWrapper
                toggleBookmark={toggleBookmark}
                bookmarkedIds={bookmarkedIds}
              />
            }
          />
          <Route path="*" element={<Navigate to="/news" replace />} />
        </Routes>
      </div>
    </div>
  );
}
