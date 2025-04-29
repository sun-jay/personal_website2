import ClientWrapper from '@/components/ClientWrapper';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>sunny-jay.com</title>
        <meta name="description" content="sunny-jay.com" />
      </Head>
      <ClientWrapper />
    </>
  );
}
