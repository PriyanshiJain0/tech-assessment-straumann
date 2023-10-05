import React, { useEffect, useRef, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { format } from "date-fns";
import Slider from "@mui/material/Slider";

const URL = "http://hapi.fhir.org/baseR4/Patient?_pretty=true&_format=json";

const Table = () => {
  const [consumeableData, setConsumableData] = useState([]);
  const { apiData: data } = useFetch(URL);
  const [ageRange, setAgeRange] = useState([0, 100]);

  const dataRef = useRef([]);

  const handleAgeRangeChange = (event: Event, newValue: number | number[]) => {
    setAgeRange(newValue as number[]);
  };

  useEffect(() => {
    if (data) {
      const renderData = data.entry.map((item: any) => {
        const { resource } = item;
        const { id, name, gender, address, telecom, birthDate } = resource;
        const obj = {
          id: id,
          name: name[0]?.given.join(" "),
          gender: gender || null,
          birthdate: birthDate
            ? format(new Date(birthDate), "yyyy-mm-dd")
            : null,
          age: getAge(birthDate),
          address: address ? address[0]?.city : null,
          phone_no: telecom ? telecom[0]?.value : null,
        };
        return obj;
      });
      setConsumableData(renderData);
      dataRef.current = renderData;
    }
  }, [data]);

  useEffect(() => {
    const [min, max] = ageRange;

    const filterData = dataRef.current.filter((item: any) => {
      return item.age >= min && item.age <= max;
    });
    setConsumableData(filterData);
  }, [ageRange]);

  const getAge = (dob: string) => {
    let age = 0;
    if (!dob) {
      return;
    }
    let birthYear = new Date(dob).getFullYear();
    let currentYear = new Date().getFullYear();
    age = currentYear - birthYear;
    return age;
  };

  const colDef = [
    { label: "Id", field: "id" },
    { label: "Name", field: "name" },
    { label: "Gender", field: "gender" },
    { label: "BirthDate", field: "birthdate" },
    { label: "Address", field: "address" },
    { label: "Phone", field: "phone_no" },
  ];

  const marks = [
    {
      value: 0,
    },
    {
      value: 20,
    },
    {
      value: 40,
    },
    {
      value: 60,
    },
    {
      value: 80,
    },
    {
      value: 100,
    },
  ];

  return (
    <div className="container">
      <div className="row mb-5">
        <div className="col-md-2 text-end fw-bold">Filter By Age </div>
        <div className="col-md-4">
          <Slider
            getAriaLabel={() => "Age range"}
            value={ageRange}
            onChange={handleAgeRangeChange}
            valueLabelDisplay="auto"
            marks={marks}
          />
        </div>
      </div>
      {consumeableData.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              {colDef.map((col, index) => {
                return <th key={`th_${index}`}>{col.label}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {consumeableData.map((row, index) => {
              return (
                <tr key={`row_${index}`}>
                  {colDef.map(({ field }, idx) => {
                    return <td key={`row_td_${idx}`}>{row[field] || "N/A"}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        "No Record Found"
      )}
    </div>
  );
};

export default Table;
