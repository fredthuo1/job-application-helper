import React from "react";
import ResumeUpload from "./components/ResumeUpload";

const App = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Job Application Helper</h1>
            <ResumeUpload />
        </div>
    );
};

export default App;
