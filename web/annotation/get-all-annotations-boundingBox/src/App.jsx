import { useState } from "react";
import PdfViewerComponent from "./components/PdfViewerComponent.jsx";
import "./App.css";

function App() {
  const [document, setDocument] = useState("document_1.pdf");
  const [handleAnnotation, setHandleAnnotation] = useState("");
  const [nextAnnotation, setNextAnnotation] = useState(0);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const objectUrl = URL.createObjectURL(file);
    setDocument(objectUrl);
  };

  const handleAnnotationCoordinates = () => {
    setHandleAnnotation("get");
    reset();
  };

  const reset = () => {
    setTimeout(() => {
      setHandleAnnotation("");
    }, 1000);
  };

  return (
    <div className="App">
      <label htmlFor="file-input" className="App-input">Open another document</label>
      <input
        id="file-input"
        type="file"
        onChange={handleFileChange}
        className="chooseFile"
        accept="application/pdf"
        name="pdf"
      />
      <button
        onClick={handleAnnotationCoordinates}
        className="btnstyle"
      >Refresh / Reset Annotations</button>
      <br/>

      <div className="App-viewer">
        <PdfViewerComponent 
          document={document} 
          handleAnnotation={handleAnnotation} 
        />
      </div>
    </div>
  );
}

export default App;


// import { useState } from "react";
// import PdfViewerComponent from "./components/PdfViewerComponent.jsx";
// import "./App.css";

// function App() {
//   const [document, setDocument] = useState("document_1.pdf");
//   const [handleAnnotation, setHandleAnnotation] = useState("");
//   const [nextAnnotation, setNextAnnotation] = useState(0);
//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     const objectUrl = URL.createObjectURL(file);
//     setDocument(objectUrl);
//   };

//   const handleAnnotationCoordinates = () => {
//     setHandleAnnotation("get");
//     reset();
//   };

//   const handleNextAnnotation = () => {
//     setNextAnnotation(nextAnnotation+1);
//   }

//   const reset = () => {
//     setTimeout(function() {
//       setHandleAnnotation("");
//     }, 1000);
//   };

//   return (
//     <div className="App">
//       <label htmlFor="file-input" className="App-input">Open another document</label>
//       <input
//         id="file-input"
//         type="file"
//         onChange={handleFileChange}
//         className="chooseFile"
//         accept="application/pdf"
//         name="pdf"
//       />
//       <button
//         onClick={handleAnnotationCoordinates}
//         className="btnstyle"
//       >Get Co-Ordinates</button>
//       <br/>
//       <button onClick={handleNextAnnotation}>Next Annotation</button>

//       <div className="App-viewer">
//         <PdfViewerComponent document={document} handleAnnotation={handleAnnotation} handleNextAnnotation={nextAnnotation}/>
//       </div>
//     </div>
//   );
// }

// export default App;