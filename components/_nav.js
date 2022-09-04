export default [{
    _name: "CSidebarNav",
    _children: [{
            _name: "CSidebarNavDropdown",
            name: "Resource",
            icon: "cib-buffer",
            items: [
                {
                    name: "Accounts",
                    icon: "cil-people",
                    to: "/resources/accounts"
                },
            ]
        },
        {
            _name: "CSidebarNavDropdown",
            name: "Handle",
            icon: "cil-sync",
            items: [{
                    name: "Cards",
                    icon: "cil-aperture",
                    to: "/handle/cards"
                },
            ]
        },
        {
            _name: "CSidebarNavDropdown",
            name: "Reports",
            icon: "cil-description",
            items: [
                
            ]
        },
    ]
}];