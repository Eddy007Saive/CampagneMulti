import PropTypes from "prop-types";
import { Typography } from "@material-tailwind/react";
import { HeartIcon } from "@heroicons/react/24/solid";

export function Footer({ brandName, brandLink, routes }) {
  const year = new Date().getFullYear();

  return (
    <footer className="py-2">
      
    </footer>
  );
}

Footer.defaultProps = {
  brandName: "Eddy Saive",
  brandLink: "laplumenoire001@gmail.com",
  routes: [
    { name: "Creative Tim", path: "https://www.creative-tim.com" },
    { name: "Email", path: "laplumenoire001@gmail.com" },
    { name: "Blog", path: "https://www.creative-tim.com/blog" },
    { name: "License", path: "https://www.creative-tim.com/license" },
  ],
};

Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
};

Footer.displayName = "/src/widgets/layout/footer.jsx";

export default Footer;
