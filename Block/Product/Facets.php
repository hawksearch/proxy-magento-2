<?php
/**
 * Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Block\Product;

use HawkSearch\Connector\Gateway\InstructionException;
use HawkSearch\Proxy\Block\Banner;
use HawkSearch\Proxy\Helper\Data as ProxyHelper;
use Magento\Framework\Exception\NotFoundException;
use Magento\Framework\View\Element\Template;

class Facets extends Template
{
    /**
     * @var ProxyHelper
     */
    private $hawkHelper;

    /**
     * @var Banner
     */
    private $banner;

    /**
     * Facets constructor.
     * @param Template\Context $context
     * @param Banner $banner
     * @param ProxyHelper $hawkHelper
     * @param array $data
     */
    public function __construct(
        Template\Context $context,
        Banner $banner,
        ProxyHelper $hawkHelper,
        array $data
    ) {
        $this->hawkHelper = $hawkHelper;
        $this->banner = $banner;
        parent::__construct($context, $data);
    }

    /**
     * @return string|null
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getFacets()
    {
        return $this->hawkHelper->getFacets();
    }

    /**
     * @return bool
     */
    public function isShowFacets()
    {
        return $this->hawkHelper->isShowFacets();
    }
}
