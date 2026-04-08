export default function MapCanvas({ mousePos, onMouseMove }) {
  return (
    <div className="map-canvas-area">
      <div className="map-tab-bar">
        <div className="map-tab active">
          阿瑟加德地图 <span className="map-tab-close">×</span>
        </div>
      </div>
      <div className="map-canvas" onMouseMove={onMouseMove}>
        <svg viewBox="0 0 2000 1200" className="map-svg-canvas">
          {/* 背景海洋 */}
          <defs>
            <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a4a6a" />
              <stop offset="100%" stopColor="#0d2a3a" />
            </linearGradient>
            <linearGradient id="landGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4a8c3f" />
              <stop offset="50%" stopColor="#6aaa4f" />
              <stop offset="100%" stopColor="#3a7a2f" />
            </linearGradient>
            <linearGradient id="landGrad2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5a9a4a" />
              <stop offset="100%" stopColor="#8abb6a" />
            </linearGradient>
            <linearGradient id="desertGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4a44a" />
              <stop offset="100%" stopColor="#dabb6a" />
            </linearGradient>
            <linearGradient id="tundraGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d8dde0" />
              <stop offset="100%" stopColor="#b8c8d0" />
            </linearGradient>
            <radialGradient id="mountainGrad">
              <stop offset="0%" stopColor="#8a7a5a" />
              <stop offset="100%" stopColor="#6a5a3a" />
            </radialGradient>
          </defs>

          {/* 海洋 */}
          <rect width="2000" height="1200" fill="url(#oceanGrad)" />

          {/* 网格线 */}
          <g opacity="0.08" stroke="#fff" strokeWidth="0.5">
            {[...Array(20)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 60} x2="2000" y2={i * 60} />
            ))}
            {[...Array(33)].map((_, i) => (
              <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="1200" />
            ))}
          </g>

          {/* 北方大陆 - 翡翠帝国 */}
          <path d="M300 100 Q400 80 550 90 Q700 70 800 100 Q850 120 900 110
                   Q950 130 1000 120 L1050 150 Q1000 200 950 250
                   Q900 300 850 280 Q750 320 650 300
                   Q550 330 450 280 Q350 250 300 200 Z"
                fill="url(#landGrad1)" stroke="#2a5a1a" strokeWidth="2" />
          {/* 山脉 */}
          <path d="M500 130 L520 100 L540 130 M550 125 L575 90 L600 125 M610 120 L635 85 L660 120"
                fill="none" stroke="#5a4a2a" strokeWidth="2.5" />
          {/* 帝都标记 */}
          <circle cx="700" cy="200" r="6" fill="#ffd700" stroke="#333" strokeWidth="2" />
          <text x="700" y="230" textAnchor="middle" fill="#ffd700" fontSize="18" fontWeight="bold">帝都</text>
          <text x="650" y="170" fill="#2a5a1a" fontSize="22" fontWeight="bold">翡翠帝国</text>

          {/* 东方大陆 - 极光之境 */}
          <path d="M1100 80 Q1200 60 1350 80 Q1500 70 1600 100
                   Q1650 150 1700 200 Q1680 300 1620 350
                   Q1500 400 1400 380 Q1300 350 1200 300
                   Q1150 250 1100 180 Z"
                fill="url(#landGrad2)" stroke="#2a5a1a" strokeWidth="2" />
          {/* 冰川 */}
          <path d="M1200 100 Q1300 80 1400 90 Q1350 130 1250 120 Z"
                fill="url(#tundraGrad)" stroke="#8a9aa0" strokeWidth="1" />
          <text x="1380" y="220" fill="#1a4a2a" fontSize="22" fontWeight="bold">极光之境</text>
          <circle cx="1350" cy="300" r="5" fill="#fff" stroke="#333" strokeWidth="1.5" />
          <text x="1350" y="325" textAnchor="middle" fill="#ccc" fontSize="14">霜蚀峰</text>

          {/* 南方大陆 - 铁岩山脉 */}
          <path d="M400 500 Q500 470 650 480 Q800 470 900 500
                   Q950 550 980 620 Q950 700 880 730
                   Q750 760 600 740 Q450 720 380 660
                   Q350 600 380 540 Z"
                fill="url(#landGrad1)" stroke="#2a5a1a" strokeWidth="2" />
          {/* 沙漠 */}
          <path d="M550 520 Q650 500 750 520 Q720 580 650 590 Q580 580 550 520 Z"
                fill="url(#desertGrad)" stroke="#aa8a3a" strokeWidth="1" />
          <text x="660" y="560" textAnchor="middle" fill="#8a6a2a" fontSize="14">大荒漠</text>
          <text x="680" y="650" fill="#2a5a1a" fontSize="22" fontWeight="bold">铁岩山脉</text>
          {/* 山脉纹理 */}
          <path d="M700 680 L720 650 L740 680 M750 675 L775 640 L800 675"
                fill="none" stroke="#5a4a2a" strokeWidth="2" />

          {/* 西南岛屿 */}
          <path d="M150 600 Q200 570 280 580 Q320 610 300 660 Q250 690 180 670 Q140 640 150 600 Z"
                fill="url(#landGrad2)" stroke="#2a5a1a" strokeWidth="1.5" />
          <text x="220" y="640" textAnchor="middle" fill="#2a5a1a" fontSize="12">翠风岛</text>

          {/* 东南群岛 */}
          <path d="M1200 550 Q1280 530 1350 560 Q1380 600 1340 640 Q1280 660 1220 630 Q1190 590 1200 550Z"
                fill="url(#landGrad1)" stroke="#2a5a1a" strokeWidth="1.5" />
          <text x="1280" y="600" textAnchor="middle" fill="#1a4a2a" fontSize="14">龙骨群岛</text>

          {/* 北方冰原 */}
          <path d="M100 30 Q400 0 700 20 Q600 60 400 50 Q200 55 100 30 Z"
                fill="url(#tundraGrad)" stroke="#8a9aa0" strokeWidth="1" opacity="0.7" />
          <path d="M1500 15 Q1700 0 1900 25 Q1800 55 1650 50 Q1520 40 1500 15 Z"
                fill="url(#tundraGrad)" stroke="#8a9aa0" strokeWidth="1" opacity="0.7" />

          {/* 南方冰原 */}
          <path d="M200 1100 Q500 1070 900 1080 Q1200 1070 1600 1090 Q1700 1120 1800 1200
                   L0 1200 Q100 1150 200 1100 Z"
                fill="url(#tundraGrad)" stroke="#8a9aa0" strokeWidth="1" opacity="0.6" />
          <text x="1000" y="1150" textAnchor="middle" fill="#6a7a8a" fontSize="24" fontWeight="bold">冻土荒原</text>

          {/* 低语之海 */}
          <text x="400" y="420" fill="#3a7aaa" fontSize="20" fontStyle="italic" opacity="0.7">低语之海</text>

          {/* 海洋标签 */}
          <text x="180" y="350" fill="#2a5a8a" fontSize="16" fontStyle="italic" opacity="0.5">西方洋</text>
          <text x="1700" y="450" fill="#2a5a8a" fontSize="16" fontStyle="italic" opacity="0.5">东方洋</text>
          <text x="1000" y="900" fill="#2a5a8a" fontSize="18" fontStyle="italic" opacity="0.5">南方深海</text>

          {/* 标题 */}
          <text x="1000" y="50" textAnchor="middle" fill="#d4c8a0" fontSize="32" fontWeight="bold" letterSpacing="4">
            阿瑟加德大陆全图
          </text>

          {/* 罗盘 */}
          <g transform="translate(250, 950)">
            <circle r="40" fill="rgba(0,0,0,0.3)" stroke="#c4a44a" strokeWidth="2" />
            <line x1="0" y1="-35" x2="0" y2="35" stroke="#c4a44a" strokeWidth="1" />
            <line x1="-35" y1="0" x2="35" y2="0" stroke="#c4a44a" strokeWidth="1" />
            <polygon points="0,-30 -5,-8 5,-8" fill="#c4a44a" />
            <polygon points="0,30 -5,8 5,8" fill="#8a7a5a" />
            <text x="0" y="-38" textAnchor="middle" fill="#c4a44a" fontSize="14" fontWeight="bold">北</text>
            <text x="0" y="52" textAnchor="middle" fill="#8a7a5a" fontSize="12">南</text>
            <text x="-45" y="5" textAnchor="middle" fill="#8a7a5a" fontSize="12">西</text>
            <text x="45" y="5" textAnchor="middle" fill="#8a7a5a" fontSize="12">东</text>
          </g>

          {/* 航线 */}
          <path d="M300 300 Q500 400 700 380 Q900 360 1100 300"
                fill="none" stroke="#5a9aaa" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.4" />
          <path d="M900 500 Q1050 520 1200 560"
                fill="none" stroke="#5a9aaa" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.4" />

          {/* 区域选中边框 */}
          <path d="M300 100 Q400 80 550 90 Q700 70 800 100 Q850 120 900 110
                   Q950 130 1000 120 L1050 150 Q1000 200 950 250
                   Q900 300 850 280 Q750 320 650 300
                   Q550 330 450 280 Q350 250 300 200 Z"
                fill="none" stroke="#ff4444" strokeWidth="3" strokeDasharray="10 5" opacity="0.8" />

          {/* 小地图 */}
          <g transform="translate(1750, 50)">
            <rect width="200" height="120" rx="4" fill="rgba(0,0,0,0.5)" stroke="#555" strokeWidth="1" />
            <rect x="30" y="10" width="60" height="30" rx="2" fill="#3a6a2a" opacity="0.6" />
            <rect x="110" y="8" width="50" height="35" rx="2" fill="#4a7a3a" opacity="0.6" />
            <rect x="40" y="55" width="55" height="30" rx="2" fill="#3a6a2a" opacity="0.6" />
            <rect x="120" y="60" width="30" height="20" rx="2" fill="#3a6a2a" opacity="0.6" />
            <rect x="20" y="95" width="160" height="15" rx="1" fill="#9aa8b0" opacity="0.3" />
            {/* 视口框 */}
            <rect x="15" y="5" width="80" height="50" rx="1" fill="none" stroke="#fff" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
      {/* 底部状态栏 */}
      <div className="map-statusbar">
        <span>X: {mousePos.x}, Y: {mousePos.y}</span>
        <span>通用提示工具</span>
        <span>提示: 开启</span>
      </div>
    </div>
  )
}
