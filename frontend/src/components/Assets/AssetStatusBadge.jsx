const AssetStatusBadge = ({ status="Unknown" }) => {
    const baseClasses = 
        "px-2 py-1 text-xs font-semibold rounded-full capitalize inline-block";

    const statusClasses = {
        Active: "bg-green-100 text-green-700",
        Inactive: "bg-red-100 text-red-700",
        Maintenance: "bg-yellow-100 text-yellow-800",
        Unknown: "bg-gray-200 text-gray-700"
    }

    const badgeClass = statusClasses[status] || statusClasses.Unknown;

    return (
        <span className={`${baseClasses} ${badgeClass}`}>
            {status}
        </span>
    );
};

export default AssetStatusBadge;
