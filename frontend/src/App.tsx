/**
 * Main App component
 */

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Login } from './views/Login';
import { NoteList } from './views/NoteList';
import { NoteEditor } from './views/NoteEditor';
import { logoutIntent, checkAuthIntent } from './intents/authIntents';
import { loadNotesIntent, initOnlineStatus, setUserPassword } from './intents/notesIntents';
import { initDB } from './services/offline';
import type { RootState, AppDispatch } from './store/store';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { isOnline } = useSelector((state: RootState) => state.notes);
  const passwordPrompted = useRef(false);

  useEffect(() => {
    // Initialize IndexedDB
    initDB();

    // Check if user is already logged in via cookie
    dispatch(checkAuthIntent());

    // Initialize online/offline listeners
    const cleanup = initOnlineStatus(dispatch);

    return cleanup;
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && !passwordPrompted.current) {
      passwordPrompted.current = true;
      // Prompt for password to decrypt notes
      const password = prompt('Enter your password to decrypt notes:');
      if (password) {
        setUserPassword(password);
        dispatch(loadNotesIntent());
      }
    } else if (!isAuthenticated) {
      passwordPrompted.current = false;
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    setUserPassword(null);
    dispatch(logoutIntent());
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Secure Notes</h1>
        <div className="header-info">
          <span className="online-status">{isOnline ? 'Online' : 'Offline'}</span>
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <div className="app-content">
        <div className="sidebar">
          <NoteList />
        </div>
        <div className="main-content">
          <NoteEditor />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
