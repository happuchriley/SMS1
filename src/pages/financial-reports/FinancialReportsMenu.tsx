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

const FinancialReportsMenu: React.FC = () => {
  const menuCards: MenuCard[] = [
    {
      title: "Fee Collection Report",
      subtitle: "View fee collection reports",
      icon: "fa-money-bill-wave",
      path: "/financial-reports/fee-collection",
      color: "border-blue-500",
    },
    {
      title: "Other Fee - All",
      subtitle: "View all other fee reports",
      icon: "fa-list",
      path: "/financial-reports/other-fee-all",
      color: "border-green-500",
    },
    {
      title: "Other Fee - Range",
      subtitle: "View other fee reports by range",
      icon: "fa-calendar-range",
      path: "/financial-reports/other-fee-range",
      color: "border-purple-500",
    },
    {
      title: "Expenditure Report",
      subtitle: "View expenditure reports",
      icon: "fa-chart-line",
      path: "/financial-reports/expenditure",
      color: "border-red-500",
    },
    {
      title: "Debtors Report",
      subtitle: "View debtors financial report",
      icon: "fa-users",
      path: "/financial-reports/debtors",
      color: "border-orange-500",
    },
    {
      title: "Creditors Report",
      subtitle: "View creditors financial report",
      icon: "fa-user-friends",
      path: "/financial-reports/creditors",
      color: "border-cyan-500",
    },
    {
      title: "Generate Ledger",
      subtitle: "Generate ledger reports",
      icon: "fa-book",
      path: "/financial-reports/generate-ledger",
      color: "border-indigo-500",
    },
    {
      title: "Trial Balance",
      subtitle: "View trial balance report",
      icon: "fa-balance-scale",
      path: "/financial-reports/trial-balance",
      color: "border-pink-500",
    },
    {
      title: "Income Statement",
      subtitle: "View income statement",
      icon: "fa-file-invoice-dollar",
      path: "/financial-reports/income-statement",
      color: "border-teal-500",
    },
    {
      title: "Chart of Accounts",
      subtitle: "View chart of accounts",
      icon: "fa-sitemap",
      path: "/financial-reports/chart-of-accounts",
      color: "border-yellow-500",
    },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Financial Reports
        </h1>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
          <Link
            to="/"
            className="text-gray-600 no-underline hover:text-primary-500 transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Financial Reports</span>
        </div>
      </div>

      {/* Financial Reports Management Cards */}
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

export default FinancialReportsMenu;

