import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head crossOrigin="anonymous">
        <script src="https://res.wx.qq.com/d/vconsole/3.14.6/vconsole.min.js"></script>
          <script dangerouslySetInnerHTML={{
            __html: `
           if (navigator.userAgent.indexOf('Mobile') > -1) {
            var vConsole = new window.VConsole();
           }`,
          }}/>
        <script src="https://res.wx.qq.com/d/journal/_next/static/chunks/8206.2a32b9d934b47b32.js" crossOrigin="anonymous"></script>
      </Head>
      <body>
        123456
      <Main/>
      <NextScript crossOrigin="anonymous"/>
      </body>
</Html>
)
}
