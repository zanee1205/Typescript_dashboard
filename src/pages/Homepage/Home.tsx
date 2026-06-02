const Home = () => {
  return (
    <div style={styles.container}>
      <img
        src="https://static.vecteezy.com/system/resources/previews/038/039/576/non_2x/ai-generated-astronaut-in-a-space-suite-isolated-on-transparent-background-free-png.png"
        alt="astronaut"
        style={styles.image}
      />
    </div>
  );
};

const styles = {
  container: {
    height: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  } as React.CSSProperties,

  image: {
    maxWidth: "450px",
    width: "100%",
    objectFit: "contain",
  } as React.CSSProperties,
};

export default Home;