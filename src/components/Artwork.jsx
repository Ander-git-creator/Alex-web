// Display a reference detail without destructively editing the user's source file.
export default function Artwork({ media, alt = '', className = '' }) {
  if (!media.crop) return <img className={`artwork ${className}`} src={media.src} alt={alt} loading="lazy" />;
  const [x, y, w, h] = media.crop;
  const [sw, sh] = media.sourceSize;
  return <svg className={`artwork ${className}`} viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt}>
    <image href={media.src} width={sw} height={sh}/>
  </svg>;
}
