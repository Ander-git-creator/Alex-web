import EcommerceGallery from './EcommerceGallery';
import './MotionGallery.css';

const item = {
  label: '动效与动画',
  wideImages: [
    ...Array.from({ length: 6 }, (_, index) => ({
      src: `/assets/motion/t2-plus-${index + 1}.gif`,
      alt: `T2 PLUS · 动画 ${index + 1}`,
      aspectRatio: 1000 / 563,
    })),
    { src: '/assets/motion/wood-chair-main.gif', alt: '木椅 · 主视角动画', aspectRatio: 16 / 9 },
    { src: '/assets/motion/wood-chair-c4.gif', alt: '木椅 · 结构动画', aspectRatio: 16 / 9 },
  ],
};

export default function MotionGallery() {
  return <div className="motion-gallery">
    <h2 className="motion-gallery-title">动效与动画</h2>
    <EcommerceGallery item={item} format="wide" showBack={false} imageScale={0.5}/>
  </div>;
}
