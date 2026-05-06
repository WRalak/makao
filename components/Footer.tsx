import Link from 'next/link';
import { Home } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerSections: FooterSection[] = [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
        { label: "Blog", href: "/blog" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Sitemap", href: "/sitemap" },
        { label: "Cookie Policy", href: "/cookies" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Tenant Guide", href: "/tenant-guide" },
        { label: "Agent Hub", href: "/agent-hub" },
        { label: "Help Center", href: "/help" },
        { label: "FAQs", href: "/faqs" }
      ]
    },
    {
      title: "Follow Us",
      links: [
        { label: "Facebook", href: "https://facebook.com" },
        { label: "Twitter", href: "https://twitter.com" },
        { label: "Instagram", href: "https://instagram.com" },
        { label: "LinkedIn", href: "https://linkedin.com" }
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-slate-100 pt-12 pb-8">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <Home className="h-6 w-6 text-blue-400" />
              <span className="ml-2 text-lg font-bold">Makao</span>
            </div>
            <p className="font-body-sm text-slate-500 mb-6 leading-relaxed">
              East Africa's premier rental platform. Find your perfect home or list your property with confidence and ease.
            </p>
            <div className="flex gap-4">
              <span className="material-symbols-outlined cursor-pointer text-slate-400 hover:text-blue-900 transition-colors">
                public
              </span>
              <span className="material-symbols-outlined cursor-pointer text-slate-400 hover:text-blue-900 transition-colors">
                group
              </span>
              <span className="material-symbols-outlined cursor-pointer text-slate-400 hover:text-blue-900 transition-colors">
                share
              </span>
            </div>
          </div>
          
          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-label-bold text-slate-800 mb-6">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="font-body-sm text-slate-500 hover:text-blue-900 transition-colors"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-body-sm text-slate-400 text-center sm:text-left">
            © {currentYear} Makao. All rights reserved. East Africa's Premier Rental Platform.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-body-sm text-slate-400 hover:text-blue-900 transition-colors">
              English (US)
            </a>
            <a href="#" className="font-body-sm text-slate-400 hover:text-blue-900 transition-colors">
              KES
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
