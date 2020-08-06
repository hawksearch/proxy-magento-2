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

namespace HawkSearch\Proxy\Block;

use HawkSearch\Connector\Gateway\InstructionException;
use HawkSearch\Proxy\Helper\Data;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NotFoundException;
use Magento\Framework\View\Element\Template;

class HawkItems extends Template
{
    /**
     * @var Banner
     */
    private $banner;

    /**
     * @var Data
     */
    private $helper;

    /**
     * HawkItems constructor.
     *
     * @param Banner $banner
     * @param Data $helper
     * @param Template\Context $context
     * @param array $data
     */
    public function __construct(
        Banner $banner,
        Data $helper,
        Template\Context $context,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->banner = $banner;
        $this->helper = $helper;
    }

    /**
     * @return Banner
     */
    public function getBanner()
    {
        return $this->banner;
    }

    /**
     * @return string
     * @throws InstructionException
     * @throws LocalizedException
     * @throws NotFoundException
     */
    public function getClickTracking()
    {
        return $this->helper->getTrackingDataHtml();
    }

    /**
     * @return string
     * @throws InstructionException
     * @throws NotFoundException
     */
    public function getTopText()
    {
        return $this->helper->getResultData()->getResponseData()->getTopText() ?? '';
    }
}
