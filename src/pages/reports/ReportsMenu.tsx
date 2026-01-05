import React from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";

interface MenuCard {
  title: string;
  subtitle: string;
  icon: string;
  path: string;
  color: string;
}

const ReportsMenu: React.FC = () => {
  const menuCards: MenuCard[] = [
    {
      title: "Populate Course - Class",
      subtitle: "Populate courses for classes",
      icon: "fa-book",
      path: "/reports/populate-course-class",
      color: "border-blue-500",
    },
    {
      title: "Populate Course - Student",
      subtitle: "Populate courses for students",
      icon: "fa-user-graduate",
      path: "/reports/populate-course-student",
      color: "border-green-500",
    },
    {
      title: "Enter Academic Result",
      subtitle: "Enter and manage academic results",
      icon: "fa-edit",
      path: "/reports/enter-academic-result",
      color: "border-purple-500",
    },
    {
      title: "Student Promotion",
      subtitle: "Manage student promotions",
      icon: "fa-arrow-up",
      path: "/reports/student-promotion",
      color: "border-orange-500",
    },
    {
      title: "End of Term Remark",
      subtitle: "Add end of term remarks",
      icon: "fa-comment-alt",
      path: "/reports/end-term-remark",
      color: "border-cyan-500",
    },
    {
      title: "Reports Footnote",
      subtitle: "Manage report footnotes",
      icon: "fa-sticky-note",
      path: "/reports/footnote",
      color: "border-indigo-500",
    },
    {
      title: "Print Group Report",
      subtitle: "Print group reports",
      icon: "fa-print",
      path: "/reports/print-group-report",
      color: "border-red-500",
    },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Reports & Assessment
        </h1>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
          <Link
            to="/"
            className="text-gray-600 no-underline hover:text-primary-500 transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Reports & Assessment</span>
        </div>
      </div>

      {/* Reports Management Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {menuCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4 border-2 ${card.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
              >
                <i className={`fas ${card.icon} text-xl sm:text-2xl text-gray-700`}></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-1 sm:mb-2">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default ReportsMenu;

