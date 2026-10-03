import { Button } from "@/components/ui/button";

export default function NewsletterFormCTA() {
  return (
    <>
      {/* Newsletter CTA Section */}
      <div className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4 md:px-6 2xl:max-w-[1400px]">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Subscribe to our newsletter
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Get the latest updates and news delivered to your inbox.
              </p>
            </div>
            <div className="mx-auto w-full max-w-md">
              <form className="flex flex-col sm:flex-row w-full gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
                <Button type="submit" className="sm:w-auto">
                  Subscribe
                </Button>
              </form>
            </div>
            <p className="text-xs text-muted-foreground">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
      {/* End Newsletter CTA Section */}
    </>
  );
}
