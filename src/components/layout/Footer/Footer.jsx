import { Link } from 'react-router-dom'
import { Building2, Phone, Mail, MapPin } from 'lucide-react'
import { FaFacebook, FaInstagram } from 'react-icons/fa'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* Brand column */}
        <div className="footer__col footer__col--brand">
          <Link to="/" className="footer__logo">
            <div className="footer__logo-icon">
              <Building2 size={18} color="#fff" strokeWidth={1.75} />
            </div>
            <div className="footer__logo-text">
              <span className="footer__logo-title">Kipapi Ramani</span>
              <span className="footer__logo-tagline">House Plans</span>
            </div>
          </Link>
          <p className="footer__desc">
            Tanzania's trusted marketplace for ready-made architectural house plans.
            Browse, buy, and build with confidence.
          </p>
          <div className="footer__social">
            <a href="#" aria-label="Facebook" className="footer__social-link"><FaFacebook size={18} /></a>
            <a href="#" aria-label="Instagram" className="footer__social-link"><FaInstagram size={18} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer__col">
          <h4 className="footer__heading">Browse</h4>
          <ul className="footer__links">
            <li><Link to="/plans" className="footer__link">All Plans</Link></li>
            <li><Link to="/plans?bedrooms=3" className="footer__link">3-Bedroom Plans</Link></li>
            <li><Link to="/plans?bedrooms=4" className="footer__link">4-Bedroom Plans</Link></li>
            <li><Link to="/plans?stories=2" className="footer__link">Double-Storey</Link></li>
            <li><Link to="/plans?style=Modern" className="footer__link">Modern Style</Link></li>
            <li><Link to="/plans?style=Bungalow" className="footer__link">Bungalows</Link></li>
          </ul>
        </div>

        {/* Account Links */}
        <div className="footer__col">
          <h4 className="footer__heading">Account</h4>
          <ul className="footer__links">
            <li><Link to="/auth"          className="footer__link">Login</Link></li>
            <li><Link to="/auth/register" className="footer__link">Create Account</Link></li>
            <li><Link to="/dashboard"     className="footer__link">My Orders</Link></li>
            <li><Link to="/cart"          className="footer__link">Cart</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer__col">
          <h4 className="footer__heading">Contact</h4>
          <ul className="footer__links footer__links--contact">
            <li>
              <MapPin size={15} className="footer__contact-icon" />
              <span>Dar es Salaam, Tanzania</span>
            </li>
            <li>
              <Phone size={15} className="footer__contact-icon" />
              <a href="tel:+255700000000" className="footer__link">+255 700 000 000</a>
            </li>
            <li>
              <Mail size={15} className="footer__contact-icon" />
              <a href="mailto:info@kipapi.co.tz" className="footer__link">info@kipapi.co.tz</a>
            </li>
          </ul>

          {/* Payment methods */}
          <div className="footer__payments">
            <span className="footer__payments-label">We accept:</span>
            <div className="footer__payment-badges">
              <span className="footer__payment-badge footer__payment-badge--mpesa">M-Pesa</span>
              <span className="footer__payment-badge footer__payment-badge--tigo">Tigo</span>
              <span className="footer__payment-badge footer__payment-badge--airtel">Airtel</span>
              <span className="footer__payment-badge footer__payment-badge--halo">Halo</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p className="footer__copy">
            &copy; {year} Kipapi Ramani. All rights reserved.
          </p>
          <p className="footer__legal">
            Plans are protected under Tanzanian copyright law. Redistribution is prohibited.
          </p>
        </div>
      </div>
    </footer>
  )
}
