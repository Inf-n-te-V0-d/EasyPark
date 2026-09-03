import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import Services from "../components/Services/Services";
import Footer from "../components/Footer/Footer";
import About from "../components/About/About";

const Home = ({ onNavigate, isDarkMode, onToggleTheme }) => {
    return (
        <div id="top">
            <Navbar onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
            <Hero onNavigate={onNavigate} />
            <Services />
            <About />
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default Home;
