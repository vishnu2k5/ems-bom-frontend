import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./configpage.css";



const CongfigPage = () => {
  const navigate = useNavigate();
  const [boardQty, setBoardQty] = useState(1);
  const [JobWork, setJobWork] = useState(false);
  const [PcbFabrication, setPcbFabrication] = useState(false);
  const [componentquote, setComponentQuote] = useState(false);
  const [files, setFiles] = useState([]);

  const handlefile = (e) => {
    const newFiles = Array.from(e.target.files);

    setFiles((prev) => [...prev, ...newFiles]);
  }

  //defult stencil price
  const regularStencilPrice = 7100
  const largeStencilPrice = 9100


  const [priceSMD, setPriceSMD] = useState("");
  const [pricePTH, setPricePTH] = useState("");
  const [traceablecomponents, setTraceableComponents] = useState(false)
  const [altenativecomponents, setAlternativeComponents] = useState(false)
  const traceablecomponent = ["Chinese website", "digikey"];
  const [selectedTraceable, setSelectedTraceable] = useState(null);

  const [error, setError] = useState(null);
  return (
    <div>
      <div>
        <h3>set job order quantity</h3>
        <label htmlFor="joborder">Job Order Quantity:</label>
        <input
          type="number"
          id="joborder"
          value={boardQty}
          onChange={(e) => setBoardQty(Number(e.target.value))}
        />
      </div>
      <div>
        <h3>select quotation mode</h3>
        <label htmlFor="jobwork">Job Work:</label>
        <input
          type="checkbox"
          id="jobwork"
          checked={JobWork}
          onChange={(e) => setJobWork(e.target.checked)}
        />
        <label htmlFor="pcbfabrication">PCB Fabrication:</label>
        <input
          type="checkbox"
          id="pcbfabrication"
          checked={PcbFabrication}
          onChange={(e) => setPcbFabrication(e.target.checked)}
        />
        <label htmlFor="componentquote">Component Quote:</label>
        <input
          type="checkbox"
          id="componentquote"
          checked={componentquote}
          onChange={(e) => setComponentQuote(e.target.checked)}
        />
      </div>
      {JobWork ? (
        <div>
          <div>
            <h3>upload customer bom</h3>
            <label htmlFor="customerbom">Choose Customer BOM:</label>
            <input
              type="file"
              id="customerbom"
              multiple
              onChange={handlefile}
            />
          </div>
          <div>
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>set job work price</h3>
            <label htmlFor="smd">Job Work Price per Board:</label>
            <input
              type="number"
              id="smd"
              value={priceSMD}
              onChange={(e) => setPriceSMD(e.target.value)}
            />
            <label htmlFor="pth">PTH Price per Board:</label>
            <input
              type="number"
              id="pth"
              value={pricePTH}
              onChange={(e) => setPricePTH(e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {PcbFabrication ? (
        <div>
          <h3>PCB Fabrication</h3>
          <div>
            <h3>selet gerber files/get pcb price</h3>
            <label htmlFor="gerberfiles">Choose Gerber Files:</label>
            <input type="file" id="gerberfiles" multiple onChange={handlefile} />
            <label htmlFor="enwu">Choose enquriy files:</label>
            <input type="file" id="enwu" multiple onChange={handlefile} />
          </div>
        </div>
      ) : null}
      {componentquote ? (
        <div>
          <h3>select component preferences</h3>
          <label htmlFor="traceablecomponents">Traceable Components:</label>
          <input type="checkbox" id="traceablecomponents" checked={traceablecomponents} onChange={(e) => {
            setTraceableComponents(e.target.checked)
            setAlternativeComponents(false)
          }} />
          <div>
            {traceablecomponents ? (
              <div>
                dropdown with traceablecomponent options
                <select value={selectedTraceable || ""}  // important for controlled component
                  onChange={(e) => setSelectedTraceable(e.target.value)}>
                  {traceablecomponent.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="alternativecomponents">Alternative Components:</label>
                <input type="checkbox" id="alternativecomponents" checked={altenativecomponents} onChange={(e) => {
                  setAlternativeComponents(e.target.checked)
                  setTraceableComponents(false)
                }} />
              </div>
            )}

          </div>
          <div>
            <h3>select customer bom</h3>
            <label htmlFor="customerbom">Choose Customer BOM:</label>
            <input
              type="file"
              id="customerbom"
              multiple
              onChange={handlefile}
            />
          </div>
        </div>
      ) : null}

      <div>
        <h3>select stencil price</h3>
        <label htmlFor="regularstencil">Regular Stencil (₹{regularStencilPrice}):</label>
        <input
          type="checkbox"
          id="regularstencil"
        />
        <label htmlFor="largestencil">Large Stencil (₹{largeStencilPrice}):</label>
        <input
          type="checkbox"
          id="largestencil"
        />
      </div>


    </div>
  )
}

export default CongfigPage
