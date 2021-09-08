import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { SitePreview } from '../components/SitePreview'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Ivan Jiang (姜希凡)</title>
        <meta name="description" content="Ivan Jiang | Web Developer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <SitePreview />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
        >
          粤ICP备2021124638号
        </a>
      </footer>
    </div>
  )
}

export default Home
