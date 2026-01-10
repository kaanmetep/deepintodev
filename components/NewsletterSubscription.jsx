"use client";
import { subscribe } from "@/app/actions";
import { useActionState } from "react";

const initialState = {
  success: false,
  message: "",
};

export default function NewsletterSubscription() {
  const [state, formAction, pending] = useActionState(subscribe, initialState);
  return (
    <>
      <form action={formAction} className="relative">
        <div className="relative z-10 flex items-center bg-white dark:bg-gray-200 shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all delay-75 max-w-xl lg:max-w-4xl mx-auto">
          <div className="flex-2">
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 text-black dark:text-gray-900 placeholder-gray-400 outline-none font-light text-xs lg:text-base focus:outline-none ring-0"
              maxLength={100}
            />
          </div>
          <button
            disabled={pending}
            type="submit"
            className="flex flex-1 relative text-gray-600 dark:text-gray-800 uppercase px-1 lg:px-5 py-2 lg:py-6 font-light 
              transition-all duration-300 ease-in-out transform
              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-100/30 text-[10px] sm:text-xs lg:text-base border-l border-gray-200 dark:border-gray-100
               items-center justify-center"
          >
            {pending ? (
              <>
                <span className="invisible">
                  {pending ? "Subscribing..." : "Subscribe To Newsletter"}
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-600 dark:border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              "Subscribe To Newsletter"
            )}
          </button>
        </div>
      </form>
      <p className="text-center mt-3 text-gray-950 dark:text-gray-100">
        Join <b>1000+</b> developers
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-center my-1 text-xs lg:text-base">
        <span className="text-gray-950 dark:text-gray-50 font-semibold">
          Be the first to know
        </span>{" "}
        when a new blog post drops. No ads, no BS. Every other week.
      </p>

      {state.message && (
        <p
          className={`${
            state?.status === "success"
              ? "text-green-600 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
          } tracking-wide font-bold text-center text-xs lg:text-base`}
        >
          {state?.status === "success" ? (
            <>
              Invitation email sent. Please check your inbox.
              <br />
              Don't forget to check your spam folder.
            </>
          ) : (
            state.message
          )}
        </p>
      )}
    </>
  );
}
