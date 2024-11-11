import PropTypes from 'prop-types'

export const PortTypes = PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    port: PropTypes.string.isRequired,
    TenantName: PropTypes.string.isRequired,
    isDefault: PropTypes.bool.isRequired
}).isRequired
