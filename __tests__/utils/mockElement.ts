export default function mockElement(htmlFragment: string) {
    const element = document.createRange().createContextualFragment(htmlFragment)
    document.body.appendChild(element)
}
