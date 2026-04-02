'use client';
import App from '../components/ui/app/App';
import { AppContextProvider } from '../contexts/AppContext';

const Page = () => {
  return (
    <AppContextProvider>
      <App />
    </AppContextProvider>
  );
};

export default Page;
