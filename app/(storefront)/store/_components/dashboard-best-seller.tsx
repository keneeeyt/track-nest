import Image from "next/image";

const BestSeller = ({ data, isLoading }: { data: any; isLoading: boolean }) => { // eslint-disable-line
  // eslint-disable-line
  let content;

  if (isLoading) {
    content = <p className="text-center mt-2">Loading...</p>;
  } else if (data.length > 0) {
    content = data.map((sale: any) => ( // eslint-disable-line
      <div key={sale.id} className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-md overflow-hidden">
          <Image
            width={400}
            height={400}
            src={sale.image}
            alt="Product"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid gap-1">
          <p className="text-sm font-medium">{sale?.name}</p>
          <p className="text-sm text-muted-foreground">
            {sale?.totalSold} total sold
          </p>
        </div>
        <p className="ml-auto font-medium">
        +{new Intl.NumberFormat("en-US", { style: "currency", currency: "PHP" }).format(sale.totalAmount)}
        </p>
      </div>
    ));
  } else {
    content = <p className="text-center mt-2">No Best Seller</p>;
  }

  return <div className="flex flex-col gap-8">{content}</div>;
};

export default BestSeller;
