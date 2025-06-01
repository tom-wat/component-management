import { Component } from '../types';

export const sampleComponents: Component[] = [
  {
    id: 'sample-1',
    name: 'プライマリボタン',
    category: 'UI',
    html: `<button class="primary-btn">
  クリックしてください
</button>`,
    css: `.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.primary-btn:active {
  transform: translateY(0);
}`,
    js: `document.querySelector('.primary-btn')?.addEventListener('click', function() {
  this.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
  setTimeout(() => {
    this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }, 200);
});`,
    tags: ['ボタン', 'プライマリ', 'アクション'],
    author: 'System',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'sample-2',
    name: 'カードコンポーネント',
    category: 'UI',
    html: `<div class="card">
  <div class="card-header">
    <h3>カードタイトル</h3>
    <span class="card-badge">NEW</span>
  </div>
  <div class="card-content">
    <p>これはカードコンポーネントのサンプルです。様々な情報を整理して表示するのに適しています。</p>
  </div>
  <div class="card-footer">
    <button class="card-btn">詳細を見る</button>
  </div>
</div>`,
    css: `.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 400px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.card-badge {
  background: #ff6b6b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.card-content {
  margin-bottom: 20px;
}

.card-content p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.card-footer {
  text-align: right;
}

.card-btn {
  background: #4ecdc4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.card-btn:hover {
  background: #45b7aa;
}`,
    js: `document.querySelector('.card-btn')?.addEventListener('click', function() {
  alert('詳細ページに移動します');
});`,
    tags: ['カード', 'UI', 'レイアウト'],
    author: 'System',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'sample-3',
    name: 'ナビゲーションメニュー',
    category: 'Navigation',
    html: `<nav class="navbar">
  <div class="nav-container">
    <div class="nav-logo">
      <span>MyWebsite</span>
    </div>
    <ul class="nav-menu">
      <li class="nav-item">
        <a href="#" class="nav-link">ホーム</a>
      </li>
      <li class="nav-item">
        <a href="#" class="nav-link">サービス</a>
      </li>
      <li class="nav-item">
        <a href="#" class="nav-link">会社情報</a>
      </li>
      <li class="nav-item">
        <a href="#" class="nav-link">お問い合わせ</a>
      </li>
    </ul>
    <div class="nav-toggle">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </div>
  </div>
</nav>`,
    css: `.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-logo span {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-left: 30px;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #667eea;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.bar {
  width: 25px;
  height: 3px;
  background: #333;
  margin: 3px 0;
  transition: 0.3s;
}

@media (max-width: 768px) {
  .nav-menu {
    position: fixed;
    left: -100%;
    top: 60px;
    flex-direction: column;
    background: white;
    width: 100%;
    text-align: center;
    transition: 0.3s;
    box-shadow: 0 10px 27px rgba(0,0,0,0.05);
    padding: 20px 0;
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-item {
    margin: 10px 0;
  }

  .nav-toggle {
    display: flex;
  }

  .nav-toggle.active .bar:nth-child(2) {
    opacity: 0;
  }

  .nav-toggle.active .bar:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  .nav-toggle.active .bar:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }
}`,
    js: `document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  navToggle?.addEventListener('click', function() {
    navMenu?.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

  // メニューアイテムをクリックしたらメニューを閉じる（モバイル）
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu?.classList.remove('active');
      navToggle?.classList.remove('active');
    });
  });
});`,
    tags: ['ナビゲーション', 'メニュー', 'レスポンシブ'],
    author: 'System',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

// 開発用：サンプルデータをローカルストレージに追加する関数
export const loadSampleData = () => {
  const existingData = localStorage.getItem('component-management-data');
  if (!existingData) {
    localStorage.setItem('component-management-data', JSON.stringify(sampleComponents));
    return true;
  }
  return false;
};
