// import logo from './logo.svg';
import './App.css';
import SearchBar from './component/others/searchBar';
// import SearchBar from "../component/others/searchBar";
function App() {

  const list = [
    { name: "project1", isDeleted: false, isCompleted: false },
    { name: "project2", isDeleted: false, isCompleted: false },
    { name: "project3", isDeleted: false, isCompleted: false },
    { name: "project4", isDeleted: false, isCompleted: false }]
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
    // <SearchBar placeholder="Enter a Todo List.." data = {list}/>
    <SearchBar placeholder="Search.." data={list}/>
  );
}

export default App;
