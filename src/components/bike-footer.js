class BikeFooter extends HTMLElement {
      constructor() {
      super();
      }
      connectedCallback() {
      this.innerHTML = `
<footer>
      <div class="footer-content">
         <div class="footer-section">
            <h3>Bike Store</h3>
            <p>Innovación y excelencia en el mundo del ciclismo desde 2005</p>
            <div class="social-icons">
               <a href="https://www.facebook.com/"><i class="fab fa-facebook-f"></i></a>
               <a href="https://www.instagram.com/"><i class="fab fa-instagram"></i></a>
               <a href="https://x.com/?lang=en"><i class="fab fa-twitter"></i></a>
               <a href="https://www.youtube.com/?app=desktop&hl=es"><i class="fab fa-youtube"></i></a>
            </div>
         </div>
         <div class="footer-section">
            <h3>Enlaces Rápidos</h3>
            <ul>
               <li><a href="index.html">Inicio</a></li>
               <li><a href="catalogofn.html">Catálogo</a></li>
               <li><a href="nosotros.html">Nosotros</a></li>
            </ul>
         </div>
         <div class="footer-section">
            <h3>Contacto</h3>
            <p><i class="fas fa-map-marker-alt"></i> Cl. 13 #103-95, Ciudad Jardín, Cali, Valle del Cauca, Colombia</p>
            <p><i class="fas fa-phone"></i> +573145701178</p>
            <p><i class="fas fa-envelope"></i> info@bikestore.com</p>
         </div>
      </div>
      <div class="footer-bottom">
         <p>Bike Store &copy; 2025 - Todos los derechos reservados</p>
      </div>
   </footer>
      `; 
      }
   }
  // Definir el elemento personalizado
   customElements.define('bike-footer', BikeFooter);

