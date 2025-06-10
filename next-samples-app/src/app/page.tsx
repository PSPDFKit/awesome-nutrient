"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import styles from "./page.module.css";
import Header from "./components/header";
import Content from "./components/content";
import Footer from "./components/footer";
const ThemeProvider = dynamic(
  () => import('@baseline-ui/core').then(mod => mod.ThemeProvider),
  { ssr: false }
);

const I18nProvider = dynamic(
  () => import('@baseline-ui/core').then(mod => mod.I18nProvider),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <ThemeProvider>
        <I18nProvider locale="en-US">
          <Header />
          <Content />
          <Footer />
        </I18nProvider>
      </ThemeProvider>
    </>
  );
}
