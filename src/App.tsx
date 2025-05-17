import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
// import BasicTables from "./pages/Tables/BasicTables";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Entidades from "./pages/Admin/Entidades";
import Operadores from "./pages/Admin/Operadores";
import Servicios from "./pages/Admin/Servicios";
import RegistroServicios from "./pages/Registro/RegistroServicios";
// import Formulario from "./pages/MesaAyudaPages/Formulario";
// import Categorias from "./pages/Categorias/Categorias";
// import VerFormulario from "./components/form/VerFormulario";
// import Respuestas from "./pages/MesaAyudaPages/Respuesta";
// import TableList from "./pages/Computers/TableList";
// import Tecnicos from "./pages/MesaAyudaPages/Tecnicos";
// import GestionarTickets from "./pages/MesaAyudaPages/GestionarTickets";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Admin */}
            <Route path="/administracion/entidades" element={<Entidades />} />
            <Route path="/administracion/operadores" element={<Operadores />} />
            <Route path="/administracion/servicios" element={<Servicios />} />
            <Route path="/registro/servicios" element={<RegistroServicios />} />

            {/* Forms */}
            {/* <Route path="/mesa-ayuda/formulario" element={<Formulario />} /> */}
            {/* <Route path="/mesa-ayuda/respuestas" element={<Respuestas />} /> */}
            {/* <Route path="/mesa-ayuda/tecnicos" element={<Tecnicos />} /> */}
            {/* <Route path="/mesa-ayuda/gestionar-tickets" element={<GestionarTickets />} /> */}

            {/* <Route path="/gestion/categorias" element={<Categorias />} /> */}

            {/* Tables */}
            {/* <Route path="/basic-tables" element={<BasicTables />} /> */}
            {/* <Route path="/computers" element={<TableList />} /> */}

            {/* Ui Elements */}
            {/* <Route path="/alerts" element={<Alerts />} /> */}
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Ruta de Formulario */}
          {/* <Route path="/ver-formulario" element={<VerFormulario />} /> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
