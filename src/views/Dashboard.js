import {useState, useEffect} from 'react'
import useAxios from "../utils/useAxios"
import jwt_decode from "jwt-decode";
import * as XLSX from 'xlsx';
import UploadExcel from './UploadExcel';
function Dashboard() {

    const [res, setRes] = useState("")
    const [excelData, setExcelData] = useState([]);
    const api = useAxios();
    const token = localStorage.getItem("authTokens")

    if (token){
      const decode = jwt_decode(token)
      var user_id = decode.user_id
      var username = decode.username
      var full_name = decode.full_name
      var image = decode.image

    }

    // useEffect(() => {
    //   const fetchData = async () => {
    //     try{

    //       setRes(response.data.response)
    //     } catch (error) {
    //       console.log(error);
    //       setRes("Something went wrong")
    //     }
    //   }
    //   fetchData()
    // }, [])

    
    // useEffect(() => {
    //   const fetchPostData = async () => {
    //     try{
    //       const response = await api.post("/test/")
    //       setRes(response.data.response)
    //     } catch (error) {
    //       console.log(error);
    //       setRes("Something went wrong")
    //     }
    //   }
    //   fetchPostData()
    // }, [])

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
    
      const reader = new FileReader();

      
      reader.onload = async (e) => {
        try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(jsonData);
  
        // Upload data to the backend
      const response = await api.post('/upload/', jsonData);
      if (response.status === 200) {
        setRes('Data uploaded successfully!');
      } else {
        setRes('Unexpected response from the server.');
      }
    }catch (error) {
      console.error('Error:', error);
      setRes('Upload failed. ${errormessage}');
    }
  };
  reader.onerror = () => {
    console.error('Error reading file:', reader.error);
    setRes('Failed to read the file.');
  };
  
      reader.readAsArrayBuffer(file);
    };


  return (
    <div>
      <>
  <div className="container-fluid" style={{ paddingTop: "100px" }}>
    <div className="row">
      <nav className="col-md-2 d-none d-md-block bg-light sidebar mt-4">
        <div className="sidebar-sticky">
          <ul className="nav flex-column">
            <li className="nav-item">
              <a className="nav-link active" href="#">
                <span data-feather="home" />
                Dashboard <span className="sr-only">(current)</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <span data-feather="file" />
                Orders
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <span data-feather="shopping-cart" />
                Products
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <span data-feather="users" />
                Customers
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <span data-feather="bar-chart-2" />
                Reports
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <span data-feather="layers" />
                Integrations
              </a>
            </li>
          </ul>
          <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
            <span>Saved reports</span>
            <a className="d-flex align-items-center text-muted" href="#">
              <span data-feather="plus-circle" />
            </a>
          </h6>
          <ul className="nav flex-column mb-2">
            <li className="nav-item">
              <a className="nav-link" href="#">
                <span data-feather="file-text" />
                Current month
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <span data-feather="file-text" />
                Last quarter
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <span data-feather="file-text" />
                Social engagement
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <span data-feather="file-text" />
                Year-end sale
              </a>
            </li>
          </ul>
        </div>
      </nav>
      <main role="main" className="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
          <h1 className="h2">Dashboard</h1>
      
          <div className="btn-toolbar mb-2 mb-md-0">
            <div className="btn-group mr-2">
            <div className="mb-4">
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="form-control" />
          </div>
            </div>
            
          </div>
        </div>
        <div className='alert alert-success'>
          <strong>{res}</strong>
        </div>
        <h2>Section title</h2>
        {excelData.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                  <tr>
                    {Object.keys(excelData[0]).map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </main>
    </div>
  </div>
  {/* Bootstrap core JavaScript
    ================================================== */}
  {/* Placed at the end of the document so the pages load faster */}
  {/* Icons */}
  {/* Graphs */}
</>

    </div>
  )
}

export default Dashboard