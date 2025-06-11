// client/src/components/layout/Footer.js
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} 趣味管理アプリケーション</p>
      </div> 
    </footer>
  );
};

export default Footer;

