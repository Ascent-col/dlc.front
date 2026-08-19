import Head from 'next/head';
import withAuth from '@/modules/auth/withAuth';
import DashboardPage from '@/modules/dashboard/DashboardPage';

function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | DLC Front</title>
        <meta
          name="description"
          content="Dashboard de actividad de formularios Visitrack"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardPage />
    </>
  );
}

export default withAuth(Dashboard, ['admin', 'superadmin']);
