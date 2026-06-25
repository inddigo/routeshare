import { createBrowserRouter } from "react-router";
import { MobileLayout } from "./layouts/MobileLayout";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { Trips } from "./pages/Trips";
import { Profile } from "./pages/Profile";
import { TripDetails } from "./pages/TripDetails";
import { ActiveRide } from "./pages/ActiveRide";
import { PaymentMethods } from "./pages/PaymentMethods";
import { AddPaymentMethod } from "./pages/AddPaymentMethod";
import { Settings } from "./pages/Settings";
import { OfferRide } from "./pages/OfferRide";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { DriverValidation } from "./pages/DriverValidation";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MobileLayout,
    children: [
      { index: true, Component: Home },
      { path: "search", Component: Search },
      { path: "trips", Component: Trips },
      { path: "profile", Component: Profile },
      { path: "trip-details", Component: TripDetails },
      { path: "active-ride", Component: ActiveRide },
      { path: "payment-methods", Component: PaymentMethods },
      { path: "add-payment-method", Component: AddPaymentMethod },
      { path: "settings", Component: Settings },
      { path: "offer-ride", Component: OfferRide },
      { path: "login", Component: Login },
      { path: "signup", Component: SignUp },
      { path: "driver-validation", Component: DriverValidation },
    ],
  },
]);
