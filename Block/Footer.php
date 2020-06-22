<?php
/**
 * Copyright (c) 2017 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Block;

use HawkSearch\Proxy\Helper\Data;
use Magento\Framework\View\Element\Template;

class Footer extends Template
{
    /**
     * @var Data
     */
    private $helper;

    /**
     * Footer constructor.
     * @param Data $helper
     * @param Template\Context $context
     * @param array $data
     */
    public function __construct(
        Data $helper,
        Template\Context $context,
        array $data
    ) {
        parent::__construct($context, $data);
        $this->helper = $helper;
    }

    public function getBaseUrl()
    {
        return $this->helper->getBaseUrl();
    }

    public function getHawkUrl()
    {
        return $this->helper->getHawkUrl();
    }

    public function getTrackingUrl()
    {
        return $this->helper->getTrackingUrl();
    }

    public function getRecommenderUrl()
    {
        return $this->helper->getRecommenderUrl();
    }

    public function getTrackingKey()
    {
        return $this->helper->getOrderTackingKey();
    }

    public function getSearchBoxes()
    {
        $ids = $this->helper->getConfigurationData('hawksearch_proxy/proxy/search_box_ids');
        return explode(',', $ids);
    }

    public function getHiddenDivName()
    {
        return $this->helper->getConfigurationData('hawksearch_proxy/proxy/autocomplete_div_id');
    }

    public function getAutosuggestParams()
    {
        return $this->helper->getConfigurationData('hawksearch_proxy/proxy/autocomplete_query_params');
    }
}
