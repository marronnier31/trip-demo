import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ROLES } from '../constants/roles';
import { C } from '../styles/tokens';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleUnauthorized = () => {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true, state: { from: `${location.pathname}${location.search}` } });
      }
    };

    window.addEventListener('tripzone:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('tripzone:unauthorized', handleUnauthorized);
  }, [location.pathname, location.search, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <style>{`
        @keyframes tz-route-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <Header />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

const HomePage = lazy(() => import('../pages/common/HomePage'));
const LoginPage = lazy(() => import('../pages/common/LoginPage'));
const FindIdPage = lazy(() => import('../pages/common/FindIdPage'));
const FindPasswordPage = lazy(() => import('../pages/common/FindPasswordPage'));
const HostApplyPage = lazy(() => import('../pages/common/HostApplyPage'));
const HostApplyFormPage = lazy(() => import('../pages/common/HostApplyFormPage'));
const HostApplyPendingPage = lazy(() => import('../pages/common/HostApplyPendingPage'));
const SignupPage = lazy(() => import('../pages/common/SignupPage'));
const MyPage = lazy(() => import('../pages/common/MyPage'));
const AttendancePage = lazy(() => import('../pages/common/AttendancePage'));
const BenefitsPage = lazy(() => import('../pages/common/BenefitsPage'));
const CouponsPage = lazy(() => import('../pages/common/CouponsPage'));
const PointsPage = lazy(() => import('../pages/common/PointsPage'));
const OverseasPage = lazy(() => import('../pages/common/OverseasPage'));
const OverseasLodgingDetailPage = lazy(() => import('../pages/common/OverseasLodgingDetailPage'));
const PackagesPage = lazy(() => import('../pages/common/PackagesPage'));
const FlightsPage = lazy(() => import('../pages/common/FlightsPage'));
const FlightStaysPage = lazy(() => import('../pages/common/FlightStaysPage'));
const LeisurePage = lazy(() => import('../pages/common/LeisurePage'));
const CarsPage = lazy(() => import('../pages/common/CarsPage'));
const SpacesPage = lazy(() => import('../pages/common/SpacesPage'));
const PromotionsPage = lazy(() => import('../pages/common/PromotionsPage'));
const PromotionDetailPage = lazy(() => import('../pages/common/PromotionDetailPage'));
const SupportCenterPage = lazy(() => import('../pages/common/SupportCenterPage'));
const ServiceReadyPage = lazy(() => import('../pages/common/ServiceReadyPage'));
const EventsPage = lazy(() => import('../pages/common/EventsPage'));
const EventDetailPage = lazy(() => import('../pages/common/EventDetailPage'));
const RecentViewedPage = lazy(() => import('../pages/common/RecentViewedPage'));
const WishlistPage = lazy(() => import('../pages/common/WishlistPage'));
const SettingsPage = lazy(() => import('../pages/common/SettingsPage'));

const LodgingListPage = lazy(() => import('../pages/user/LodgingListPage'));
const LodgingDetailPage = lazy(() => import('../pages/user/LodgingDetailPage'));
const BookingPage = lazy(() => import('../pages/user/BookingPage'));
const BookingCompletePage = lazy(() => import('../pages/user/BookingCompletePage'));
const MyBookingsPage = lazy(() => import('../pages/user/MyBookingsPage'));
const InquiryCreatePage = lazy(() => import('../pages/user/InquiryCreatePage'));
const MyInquiriesPage = lazy(() => import('../pages/user/MyInquiriesPage'));

const SellerDashboardPage = lazy(() => import('../pages/seller/SellerDashboardPage'));
const SellerLodgingCreatePage = lazy(() => import('../pages/seller/SellerLodgingCreatePage'));
const SellerLodgingEditPage = lazy(() => import('../pages/seller/SellerLodgingEditPage'));
const SellerLodgingListPage = lazy(() => import('../pages/seller/SellerLodgingListPage'));
const SellerReservationListPage = lazy(() => import('../pages/seller/SellerReservationListPage'));
const SellerInquiryPage = lazy(() => import('../pages/seller/SellerInquiryPage'));
const SellerInquiryChatPage = lazy(() => import('../pages/seller/SellerInquiryChatPage'));

const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUserListPage = lazy(() => import('../pages/admin/AdminUserListPage'));
const AdminSellerListPage = lazy(() => import('../pages/admin/AdminSellerListPage'));
const AdminInquiryListPage = lazy(() => import('../pages/admin/AdminInquiryListPage'));
const AdminRewardsPage = lazy(() => import('../pages/admin/AdminRewardsPage'));
const AdminEventsPage = lazy(() => import('../pages/admin/AdminEventsPage'));

function RouteFallback() {
  return (
    <div style={s.fallbackWrap}>
      <div style={s.fallbackSpinner} />
      <p style={s.fallbackText}>페이지를 불러오는 중입니다...</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/find-id" element={<FindIdPage />} />
          <Route path="/find-password" element={<FindPasswordPage />} />
          <Route path="/host/apply" element={<ProtectedRoute allowedRoles={[ROLES.USER]}><HostApplyPage /></ProtectedRoute>} />
          <Route path="/host/apply/form" element={<ProtectedRoute allowedRoles={[ROLES.USER]}><HostApplyFormPage /></ProtectedRoute>} />
          <Route path="/host/apply/pending" element={<ProtectedRoute allowedRoles={[ROLES.USER]}><HostApplyPendingPage /></ProtectedRoute>} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/lodgings" element={<LodgingListPage />} />
          <Route path="/lodgings/:lodgingId" element={<LodgingDetailPage />} />

          <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
          <Route path="/benefits" element={<ProtectedRoute><BenefitsPage /></ProtectedRoute>} />
          <Route path="/coupons" element={<ProtectedRoute><CouponsPage /></ProtectedRoute>} />
          <Route path="/points" element={<ProtectedRoute><PointsPage /></ProtectedRoute>} />
          <Route path="/support" element={<SupportCenterPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/promotions/:promotionSlug" element={<PromotionDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventSlug" element={<EventDetailPage />} />
          <Route path="/recent" element={<ProtectedRoute><RecentViewedPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/overseas" element={<OverseasPage />} />
          <Route path="/overseas/:lodgingId" element={<OverseasLodgingDetailPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/flight-stays" element={<FlightStaysPage />} />
          <Route path="/leisure" element={<LeisurePage />} />
          <Route path="/cars" element={<CarsPage />} />
          <Route path="/spaces" element={<SpacesPage />} />
          <Route path="/booking/:lodgingId" element={<ProtectedRoute allowedRoles={[ROLES.USER]}><BookingPage /></ProtectedRoute>} />
          <Route path="/booking/complete" element={<ProtectedRoute allowedRoles={[ROLES.USER]}><BookingCompletePage /></ProtectedRoute>} />
          <Route path="/my/bookings" element={<ProtectedRoute allowedRoles={[ROLES.USER]}><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/inquiry/create" element={<ProtectedRoute><InquiryCreatePage /></ProtectedRoute>} />
          <Route path="/my/inquiries" element={<ProtectedRoute><MyInquiriesPage /></ProtectedRoute>} />

          <Route path="/seller" element={<ProtectedRoute allowedRoles={[ROLES.SELLER]}><SellerDashboardPage /></ProtectedRoute>} />
          <Route path="/seller/lodgings" element={<ProtectedRoute allowedRoles={[ROLES.SELLER]}><SellerLodgingListPage /></ProtectedRoute>} />
          <Route path="/seller/lodgings/create" element={<ProtectedRoute allowedRoles={[ROLES.SELLER]}><SellerLodgingCreatePage /></ProtectedRoute>} />
          <Route path="/seller/lodgings/:lodgingId/edit" element={<ProtectedRoute allowedRoles={[ROLES.SELLER]}><SellerLodgingEditPage /></ProtectedRoute>} />
          <Route path="/seller/reservations" element={<ProtectedRoute allowedRoles={[ROLES.SELLER]}><SellerReservationListPage /></ProtectedRoute>} />
          <Route path="/seller/inquiries" element={<ProtectedRoute allowedRoles={[ROLES.SELLER]}><SellerInquiryPage /></ProtectedRoute>} />
          <Route path="/seller/inquiries/:inquiryId" element={<ProtectedRoute allowedRoles={[ROLES.SELLER]}><SellerInquiryChatPage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminUserListPage /></ProtectedRoute>} />
          <Route path="/admin/sellers" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminSellerListPage /></ProtectedRoute>} />
          <Route path="/admin/inquiries" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminInquiryListPage /></ProtectedRoute>} />
          <Route path="/admin/rewards" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminRewardsPage /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminEventsPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const s = {
  fallbackWrap: {
    minHeight: '40vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    color: C.textSub,
    background: '#fff',
  },
  fallbackSpinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: `3px solid ${C.borderLight}`,
    borderTopColor: C.primary,
    animation: 'tz-route-spin 0.8s linear infinite',
  },
  fallbackText: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
  },
};
