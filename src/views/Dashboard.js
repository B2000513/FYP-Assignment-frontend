import { useState } from "react";
import useAxios from "../utils/useAxios";
import UploadExcel from "./UploadExcel";
import Overview from "./overview";
import Chatbot from "./WidgetChatbot";

function Dashboard() {
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const api = useAxios();

 // Adjust the path if necessary

 const handleChatSubmit = async () => {
  try {
    console.time("API Request");
    const response = await axios.post('http://127.0.0.1:8000/api/chatbot/', { message: "Hello" });
    console.timeEnd("API Request");
    console.log(response.data);
  } catch (error) {
    console.error("Chatbot request failed:", error);
  }
};

  return (
    <div>
      <div className="container-fluid" style={{ paddingTop: "100px" }}>
        <div className="row">
          <nav className="col-md-2 d-none d-md-block bg-light sidebar mt-4">
            <div className="sidebar-sticky">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className="nav-link active" href="#">
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <main role="main" className="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
            <h1 className="h2">Telecom Customer Churn Dashboard</h1>
            <UploadExcel />
            <Overview />
            <Chatbot />

            
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
