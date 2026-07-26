import Navbar from "../components/Navbar/Navbar";

const Home = () => {

    return (

        <>

            <Navbar />

            <section
                className="pt-24 h-screen flex justify-center items-center"
            >

                <h1 className="text-6xl font-bold">

                    Welcome to
                    <span className="text-emerald-500">
                        {" "}EasyPark
                    </span>

                </h1>

            </section>

        </>

    );
};

export default Home;