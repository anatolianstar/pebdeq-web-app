import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
// import ThemePerformanceMonitor from './ThemePerformanceMonitor';
import './ResponsiveThemeTest.css';

const ResponsiveThemeTest = () => {
  const { currentTheme, themesArray, changeTheme } = useTheme();
  const [screenSize, setScreenSize] = useState('desktop');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const testComponents = {
    buttons: [
      { type: 'primary', text: 'Primary Button' },
      { type: 'secondary', text: 'Secondary Button' },
      { type: 'outline', text: 'Outline Button' },
      { type: 'danger', text: 'Danger Button' }
    ],
    cards: [
      { title: 'Product Card', content: 'This is a product card with theme colors' },
      { title: 'Info Card', content: 'Information card with proper spacing' },
      { title: 'Feature Card', content: 'Feature highlight card design' }
    ],
    forms: [
      { type: 'text', placeholder: 'Enter your name' },
      { type: 'email', placeholder: 'Enter your email' },
      { type: 'password', placeholder: 'Enter your password' }
    ]
  };

  return (
    <div className="responsive-theme-test">
      <div className="test-header">
        <h2>Responsive Theme Test</h2>
        <div className="test-info">
          <span className="screen-size">Screen: {screenSize}</span>
          <span className="current-theme">Theme: {currentTheme}</span>
        </div>
      </div>

      {/* Performance Monitor */}
      {/* <ThemePerformanceMonitor /> */}

      <div className="test-content">
        {/* Theme Selector Section */}
        <section className="test-section">
          <h3>Theme Selection</h3>
          <div className="theme-buttons">
            {themesArray.map((theme) => (
              <button
                key={theme.id}
                className={`theme-btn ${theme.id === currentTheme ? 'active' : ''}`}
                onClick={() => changeTheme(theme.id)}
              >
                {theme.icon} {theme.name}
              </button>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="test-section">
          <h3>Typography</h3>
          <div className="typography-test">
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <p>This is a paragraph with normal text that should be readable in all themes.</p>
            <p className="text-muted">This is muted text that should have secondary color.</p>
            <small>This is small text for additional information.</small>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="test-section">
          <h3>Buttons</h3>
          <div className="buttons-test">
            {testComponents.buttons.map((btn, index) => (
              <button key={index} className={`btn btn-${btn.type}`}>
                {btn.text}
              </button>
            ))}
          </div>
        </section>

        {/* Cards Section */}
        <section className="test-section">
          <h3>Cards</h3>
          <div className="cards-test">
            {testComponents.cards.map((card, index) => (
              <div key={index} className="test-card">
                <h4>{card.title}</h4>
                <p>{card.content}</p>
                <button className="btn btn-primary">Action</button>
              </div>
            ))}
          </div>
        </section>

        {/* Forms Section */}
        <section className="test-section">
          <h3>Forms</h3>
          <div className="forms-test">
            <form className="test-form">
              {testComponents.forms.map((field, index) => (
                <div key={index} className="form-group">
                  <label htmlFor={`field-${index}`}>
                    {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                  </label>
                  <input
                    id={`field-${index}`}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="form-input"
                  />
                </div>
              ))}
              <button type="submit" className="btn btn-primary">Submit</button>
            </form>
          </div>
        </section>

        {/* Navigation Section */}
        <section className="test-section">
          <h3>Navigation</h3>
          <nav className="test-nav">
            <ul>
              <li><button className="nav-link active">Home</button></li>
              <li><button className="nav-link">Products</button></li>
              <li><button className="nav-link">Categories</button></li>
              <li><button className="nav-link">About</button></li>
              <li><button className="nav-link">Contact</button></li>
            </ul>
          </nav>
        </section>

        {/* Layout Test */}
        <section className="test-section">
          <h3>Layout Test</h3>
          <div className="layout-test">
            <div className="layout-sidebar">
              <h4>Sidebar</h4>
              <ul>
                <li>Menu Item 1</li>
                <li>Menu Item 2</li>
                <li>Menu Item 3</li>
              </ul>
            </div>
            <div className="layout-main">
              <h4>Main Content</h4>
              <p>This is the main content area that should adapt to different screen sizes.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResponsiveThemeTest; 