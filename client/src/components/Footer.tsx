import { Waves, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { settingsAPI } from '../lib/settingsAPI';

export function Footer() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await settingsAPI.getAll();
      setFirstName(settings.siteName);
      setLastName(settings.siteNameSecondPart);
      setSiteDescription(settings.siteDescription);
      setContactAddress(settings.contactAddress);
      setContactPhone(settings.contactPhone);
      setContactEmail(settings.contactEmail);
    };
    fetchSettings();
  }, []);

  return (
    <footer className="relative mt-auto bg-aqua-900 text-aqua-200">
      {/* Wave divider bridging page canvas into the deep footer */}
      <div className="absolute inset-x-0 -top-px overflow-hidden leading-none" aria-hidden="true">
        <svg
          className="block w-full h-12 sm:h-16 text-foam-100"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,40 C240,90 480,0 720,28 C960,56 1200,80 1440,36 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-aqua-700 text-aqua-200">
                <Waves className="h-5 w-5" />
              </span>
              <span className="leading-none">
                <span className="block font-display text-xl font-medium text-white">
                  {firstName}
                </span>
                <span className="block font-display text-[0.7rem] font-light uppercase tracking-[0.25em] text-aqua-400">
                  {lastName}
                </span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-aqua-300 max-w-sm">{siteDescription}</p>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <h3 className="eyebrow !text-aqua-400 mb-5">สำรวจ</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'หน้าหลัก' },
                { to: '/rooms', label: 'ห้องพักและวิลล่า' },
                { to: '/dashboard', label: 'ค้นหาการจอง' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1.5 text-sm text-aqua-300 transition-colors hover:text-sun-300"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="eyebrow !text-aqua-400 mb-5">ติดต่อเรา</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-sun-400" />
                <span className="text-aqua-300">{contactAddress}</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-sun-400" />
                <span className="text-aqua-300">{contactPhone}</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-sun-400" />
                <span className="text-aqua-300 break-all">{contactEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-aqua-800 pt-8">
          <p className="text-xs text-aqua-400">
            &copy; {new Date().getFullYear()} {firstName} {lastName}. สงวนลิขสิทธิ์ทั้งหมด
          </p>
        </div>
      </div>
    </footer>
  );
}
