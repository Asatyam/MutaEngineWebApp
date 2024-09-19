import '@/styles/globals.css';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function App({ Component, pageProps }) {
  return (
    <GoogleReCaptchaProvider
    reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY}
    >
    <Component {...pageProps} />
    </GoogleReCaptchaProvider>
  );
}
