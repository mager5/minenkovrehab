import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  override render() {
    return (
      <Html lang='ru'>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
