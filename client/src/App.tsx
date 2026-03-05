import './App.css';
import CategoryInput from './components/CategoryInput';

function App() {
  const handleSearch = (categories: string[]) => {
    console.log('Searching for:', categories);
    // Search logic will be wired up in future issues
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>💍 Wedding Scanner</h1>
        <p>Find the best deals on Alibaba &amp; AliExpress for your big day</p>
      </header>
      <main className="app-main">
        <CategoryInput onSearch={handleSearch} />
      </main>
    </div>
  );
}

export default App;
