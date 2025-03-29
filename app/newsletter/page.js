import NewsletterSubscription from "@/components/NewsletterSubscription";
const Page = () => {
  return (
    <div className="md:h-full mx-4  sm:mx-10 h-screen flex flex-col  items-center justify-center">
      <h2 className="mb-4 lg:mb-8 text-2xl md:text-3xl lg:text-4xl dark:text-gray-50 text-center">
        get notified when new blog drops.
      </h2>
      <div className="w-full">
        <div className="grow">
          <NewsletterSubscription />
        </div>
      </div>
    </div>
  );
};

export default Page;
