// Replace content and media here. All biography, statistics and projects are demo content.
// For real assets use { src: '/assets/work.jpg' } without a crop.
// crop is [x, y, width, height] in pixels in the supplied reference screenshot.
// Background below the hero. Based on the supplied Grainient preset;
// gentler contrast preserves its dark green / plum tones instead of clipping to black.
export const background = {
  color1: '#083625', color2: '#1c0515', color3: '#220619',
  timeSpeed: 0.25, colorBalance: 0, warpStrength: 1,
  warpFrequency: 5, warpSpeed: 2, warpAmplitude: 50,
  blendAngle: 0, blendSoftness: 0.21, rotationAmount: 500,
  noiseScale: 1.45, grainAmount: 0.07, grainScale: 0.2,
  grainAnimated: false, contrast: 1.05, gamma: 1, saturation: 1,
  centerX: 0, centerY: 0, zoom: 0.9,
};
const reference = '/assets/reference-gallery.png';
export const artwork = {
  perfume: { src: reference, crop: [319, 677, 158, 186], sourceSize: [1669, 942] },
  pastel: { src: reference, crop: [108, 683, 137, 184], sourceSize: [1669, 942] },
  amber: { src: reference, crop: [514, 673, 157, 185], sourceSize: [1669, 942] },
  botanical: { src: reference, crop: [720, 671, 163, 189], sourceSize: [1669, 942] },
  home: { src: reference, crop: [936, 669, 155, 191], sourceSize: [1669, 942] },
  coffee: { src: reference, crop: [1140, 673, 165, 187], sourceSize: [1669, 942] },
  music: { src: reference, crop: [1342, 675, 178, 192], sourceSize: [1669, 942] },
};
export const profile = {
  name: 'XIAOFENG', greeting: 'Hi, I am XiaoFeng!',
  roles: '视觉设计师 / AI 设计师 / 电商设计师',
  intro: '我把视觉系统、品牌叙事和 AI 工作流，连接成能够落地的设计表达。擅长从 0 到 1 搭建风格方向，让品牌、产品与电商视觉更有记忆点，也更具商业价值。',
  phone: '136******81', wechat: 'mer**ex', email: 'xf.chan@outlook.com',
  contactReady: true,
  avatar: { src: '/assets/about-holo-portrait.webp' },
  hero: {
    videos: ['/assets/hero-video-1.mp4', '/assets/hero-video-2.mp4'],
  },
  stats: [{value:'7+',label:'设计经验'}, {value:'30+',label:'项目落地'}, {value:'500+',label:'视觉画面'}],
  building: ['品牌视觉系统', 'AIGC 视觉工作流', '短视频封面体系', '电商营销视觉'],
};
export const galleryItems = [
  'rh_15fb3a1fb422.webp',
  'rh_8e1f64542d0f.webp',
  'rh_a65200503877.webp',
  'rh_c798fa4a2e83.webp',
  'rh_c798fa4a2e832.webp',
  'WEB 渲染海报封面.webp',
  'WEB三维渲染 封面.webp',
].map((file, index) => ({
  id: file,
  image: `/assets/hero-gallery/${encodeURIComponent(file)}`,
  text: '',
  alt: `视觉作品 ${index + 1}`,
}));
export const projects = [
  { id: 'product', title: '3D产品视觉', en: 'PRODUCT & STILL LIFE', tags: '电商视觉 / 三维渲染 / 材质光影', media: { src: '/assets/work-product-custom.webp' }, description: '以鲜明色彩和材质语言，探索产品的视觉识别。通过场景、灯光与构图，让商品信息变得清晰而富有吸引力。', gallery: [artwork.coffee,artwork.botanical,artwork.amber] },
  { id: 'space', title: 'AI赋能', en: 'IMAGINATION IN SPACE', tags: '风格探索 / 品牌表达 / 视觉叙事', media: { src: '/assets/cover-ai-kitchen.webp' }, description: '从色彩和情绪出发，构建充满想象力的视觉空间，让每个场景都有自己的故事。', gallery: [artwork.pastel,artwork.music,artwork.home] },
  { id: 'brand', title: '动效与动画', en: 'BRAND & E-COMMERCE', tags: '动态视觉 / 三维动画 / 动态光影', media: { src: '/assets/work-motion-t2-galaxy.webp' }, description: '融合动态视觉与三维动画，以光影、节奏和运动建立更具感染力的视觉表达。', gallery: [artwork.perfume,artwork.amber,artwork.botanical] },
];
export const career = [
  { date: '2023.06-2026.03', company: '深圳市城市行科技有限公司', role: '跨境电商/视觉设计师', description: '负责品牌视觉，AI设计项目主导，多站点跨境平台电商营销图与产品包装说明书。' },
  { date: '2020.09-2022.12', company: '深圳市前海仁豪科技有限公司', role: '独立站电商设计师', description: 'fb/tk/shopify等海外渠道的推广素材全案设计，负责素材筛选与再创作。' },
  { date: '2020.03-2020.06', company: '深圳市雪荞食品有限公司', role: '电商设计师', description: '负责电商平台视觉，新媒体推广投放素材，助力产品流量与转化率提升。' },
];
export const strengths = [
  {title:'完整项目主导能力', en:'END-TO-END DESIGN', description:'从创意方向到最终交付，让每一步设计都回应项目目标。', shape:'orbit', details:['需求拆解与项目节奏规划', '跨阶段推进视觉落地', '把控质量、效率与交付结果']},
  {title:'品牌视觉体系搭建', en:'BRAND SYSTEM', description:'让每一次表达，都成为品牌的积累。', shape:'blobs', details:['品牌识别系统梳理', '视觉规范与延展模板', '统一多渠道传播质感']},
  {title:'AI 设计提效', en:'AI-POWERED WORKFLOW', description:'将 AI 融入创作流程，拓展创意边界。',shape:'star', details:['AIGC 创意探索', '风格推演与方案筛选', '建立可复用工作流']},
  {title:'设计管理统筹', en:'DESIGN MANAGEMENT', description:'梳理规范与交付节奏，让好设计稳定发生。',shape:'stack', details:['多项目并行排期', '设计标准与复盘沉淀', '稳定交付与风险']},
  {title:'跨部门协同', en:'COLLABORATION', description:'连接设计与业务，共同推进想法落地。',shape:'ring', details:['连接产品、运营与研发', '将设计语言转成执行方案', '推动创意进入真实场景']},
];



