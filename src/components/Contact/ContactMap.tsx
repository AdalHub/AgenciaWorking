import { MapWrapper, Frame } from './ContactMapStyles';

export default function ContactMap() {
  return (
    <MapWrapper>
      <Frame
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.6649197592774!2d-99.14247088826504!3d23.759325578575453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x867953995347b27d%3A0x90a5cf3af8b954a9!2sPaseo%20Santaf%C3%A9%2C%20Av%20Tamaulipas%203191-Local%203%20y%204%2C%20Fraccionamiento%20del%20Valle%2C%2087025%20Cdad.%20Victoria%2C%20Tamps.%2C%20Mexico!5e0!3m2!1sen!2sus!4v1749186301132!5m2!1sen!2sus"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </MapWrapper>
  );
}
