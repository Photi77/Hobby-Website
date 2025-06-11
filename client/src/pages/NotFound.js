
// client/src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>ページが見つかりません</h2>
      <p>お探しのページは存在しないか、移動した可能性があります。</p>
      <Link to="/" className="btn btn-primary">
        ホームに戻る
      </Link>
    </div>
  );
};

export default NotFound;
