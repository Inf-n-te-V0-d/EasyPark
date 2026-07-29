import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import Services from "../components/Services/Services";
import Footer from "../components/Footer/Footer";
import About from "../components/About/About";

const Home = () => {

    return (

        <div id="top">

            <Navbar />
            <Hero />
            <Services />
            <About />
            <Footer />
        </div>

    );
};

export default Home;
