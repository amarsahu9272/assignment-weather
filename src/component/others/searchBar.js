import React, { useState } from "react";
import './searchBar.css'


function SearchBar({ placeholder, data }) {
    const [filteredData, setFilterData] = useState([])
    const [wordEntered, setWordEntered] = useState("")

    const handleFilter = (event) => {
        const searchWord = event.target.value;
        setWordEntered(searchWord)
        const newFilter = data.filter((value) => {
            return value.name.toLowerCase().includes(searchWord.toLowerCase())
        })

        if (searchWord === "") {
            setFilterData([])
        }
        else {
            setFilterData(newFilter)
        }
    }



    return (
        <div className="search">
            <div className="searchInputs">
                <input type="text" placeholder={placeholder} value={wordEntered} onChange={handleFilter} />
            </div>
            {filteredData.length !== 0 && (
                <div className="datResult">
                    {filteredData.slice(0, 2).map((value) => {
                        return <div className="dataItem">{value.name}</div>;
                    })}</div>)}

        </div>
    )
}

export default SearchBar