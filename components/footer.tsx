
export function SiteFooter() {
  const thisYear = new Date().getFullYear()
  
  return (
    <footer className="border-grid border-t py-4 md:px-8 md:py-0">
      <div className="container-wrapper">
        <div className="container py-4">
          <div className="text-balance text-center text-xs leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href={`https://cervantesklc.com`}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Kenneth Louie Cervantes
            </a>
            {" "} {thisYear} © AYA LAGE
          </div>
        </div>
      </div>
    </footer>
  )
}